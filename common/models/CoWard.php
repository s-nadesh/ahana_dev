<?php

namespace common\models;

use common\models\query\CoWardQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_ward".
 *
 * @property integer $ward_id
 * @property integer $tenant_id
 * @property string $ward_name
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class CoWard extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_ward';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['ward_name', 'floor_id'], 'required'],
                [['tenant_id', 'created_by', 'modified_by', 'floor_id'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['ward_name'], 'string', 'max' => 50],
                [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'floor_id', 'ward_name', 'deleted_at'], 'message' => 'The combination of Ward Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'ward_id' => 'Ward ID',
            'tenant_id' => 'Tenant ID',
            'floor_id' => 'Floor',
            'ward_name' => 'Ward Name',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getFloor() {
        return $this->hasOne(CoFloor::className(), ['floor_id' => 'floor_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getRoom() {
        return $this->hasMany(CoRoom::className(), ['ward_id' => 'ward_id']);
    }

    public static function find() {
        return new CoWardQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'floor_name' => function ($model) {
                return (isset($model->floor) ? $model->floor->floor_name : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function getWardList($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Ward Added Successfully (#' . $this->ward_name . ' )';
        else
            $activity = 'Ward Updated Successfully (#' . $this->ward_name . ' )';
        CoAuditLog::insertAuditLog(CoWard::tableName(), $this->ward_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
