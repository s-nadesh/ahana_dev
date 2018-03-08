<?php

namespace common\models;

use common\models\query\CoFloorQuery;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "co_floor".
 *
 * @property integer $floor_id
 * @property integer $tenant_id
 * @property string $floor_name
 * @property string $floor_code
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 */
class CoFloor extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_floor';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['floor_name'], 'required'],
                [['tenant_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['floor_name'], 'string', 'max' => 50],
                [['floor_code'], 'string', 'max' => 2],
                [['tenant_id'], 'unique', 'targetAttribute' => ['floor_name', 'tenant_id', 'deleted_at'], 'message' => 'The combination of Floor Name has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'floor_id' => 'Floor ID',
            'tenant_id' => 'Tenant ID',
            'floor_name' => 'Floor Name',
            'floor_code' => 'Floor Code',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
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
    public function getCoWards() {
        return $this->hasMany(CoWard::className(), ['floor_id' => 'floor_id']);
    }

    public static function find() {
        return new CoFloorQuery(get_called_class());
    }

    public static function getFloorList($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Floor Added Successfully (#' . $this->floor_name . ' )';
        else
            $activity = 'Floor Updated Successfully (#' . $this->floor_name . ' )';
        CoAuditLog::insertAuditLog(CoFloor::tableName(), $this->floor_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
