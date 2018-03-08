<?php

namespace common\models;

use common\models\query\CoCityQuery;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;


/**
 * This is the model class for table "co_master_city".
 *
 * @property integer $city_id
 * @property integer $tenant_id
 * @property integer $state_id
 * @property string $city_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoMasterState $state
 */
class CoMasterCity extends RActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'co_master_city';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['state_id', 'city_name'], 'required'],
            [['state_id', 'created_by', 'modified_by', 'tenant_id'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'tenant_id', 'deleted_at'], 'safe'],
            [['city_name'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'city_id' => 'City ID',
            'state_id' => 'State Name',
            'city_name' => 'City Name',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getState()
    {
        return $this->hasOne(CoMasterState::className(), ['state_id' => 'state_id']);
    }
    
    public static function getCitylist() {
        return ArrayHelper::map(self::find()->all(), 'city_id', 'city_name');
    }
    
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }
    
    public static function find() {
        return new CoCityQuery(get_called_class());
    }
    
    public function fields() {
        $extend = [
            'country_id' => function ($model) {
                return (isset($model->state->country) ? $model->state->country->country_id : '-');
            },
            'country_name' => function ($model) {
                return (isset($model->state->country) ? $model->state->country->country_name : '-');
            },
            'state_name' => function ($model) {
                return (isset($model->state) ? $model->state->state_name : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }
    
    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'City Added Successfully (#' . $this->city_name . ' )';
        else
            $activity = 'City Updated Successfully (#' . $this->city_name . ' )';
        CoAuditLog::insertAuditLog(CoMasterCity::tableName(), $this->city_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }
}
