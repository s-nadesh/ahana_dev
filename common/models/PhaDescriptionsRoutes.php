<?php

namespace common\models;

use common\models\query\PhaDescriptionsRoutesQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_descriptions_routes".
 *
 * @property integer $description_route_id
 * @property integer $tenant_id
 * @property integer $description_id
 * @property integer $route_id
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatPrescriptionRoute $route
 * @property PhaProductDescription $description
 * @property CoTenant $tenant
 */
class PhaDescriptionsRoutes extends RActiveRecord {
    
    public $route_ids;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_descriptions_routes';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['tenant_id', 'route_ids'], 'required', 'on' => 'routeassign'],
            [['tenant_id', 'description_id', 'route_id', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at', 'route_ids'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'description_route_id' => 'Description Route ID',
            'tenant_id' => 'Tenant ID',
            'description_id' => 'Description ID',
            'route_id' => 'Route ID',
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
    public function getRoute() {
        return $this->hasOne(PatPrescriptionRoute::className(), ['route_id' => 'route_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getDescription() {
        return $this->hasOne(PhaProductDescription::className(), ['description_id' => 'description_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaDescriptionsRoutesQuery(get_called_class());
    }

}
